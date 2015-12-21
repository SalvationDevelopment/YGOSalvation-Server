--Xyz Encore
function c80800008.initial_effect(c)
  --Activate
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_TODECK+CATEGORY_SPECIAL_SUMMON)
	e1:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_FREE_CHAIN)
	e1:SetTarget(c80800008.target)
	e1:SetOperation(c80800008.activate)
	c:RegisterEffect(e1)
end

function c80800008.filter(c)
	return c:IsFaceup() and c:IsType(TYPE_XYZ) and c:GetOverlayCount()>0
end
function c80800008.target(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return chkc:IsLocation(LOCATION_MZONE) and chkc:IsControler(1-tp) and c80800008.filter(chkc) end
	if chk==0 then return Duel.IsExistingTarget(c80800008.filter,tp,0,LOCATION_MZONE,1,nil)
	end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_TARGET)
	Duel.SelectTarget(tp,c80800008.filter,tp,0,LOCATION_MZONE,1,1,nil)
	Duel.SetChainLimit(aux.FALSE)
end
function c80800008.spfilter(c,e,tp)
	return c:IsLocation(LOCATION_GRAVE) and c:IsType(TYPE_MONSTER) and
		   c:IsCanBeSpecialSummoned(e,0,tp,false,false)	
end
function c80800008.activate(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	local g=Duel.GetChainInfo(0,CHAININFO_TARGET_CARDS)
	local tc=g:GetFirst()
	local og=tc:GetOverlayGroup()
	if tc:RemoveOverlayCard(tp,tc:GetOverlayCount(),tc:GetOverlayCount(),REASON_EFFECT)
	then
		og=og:Filter(c80800008.spfilter,nil,e,tp)
		if Duel.SendtoDeck(tc,nil,0,REASON_EFFECT) and og:GetCount()>0 then
			Duel.BreakEffect()
			local ft=Duel.GetLocationCount(1-tp,LOCATION_MZONE)
			if ft<1 then return end
			Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_SPSUMMON)
			
			og=og:Select(tp,ft,ft,nil)
			local tc1=og:GetFirst()
			while tc1 do
				Duel.SpecialSummonStep(tc1,0,tp,1-tp,false,false,POS_FACEUP_DEFENCE)
				if tc1:GetLevel()>1 then
					local e1=Effect.CreateEffect(c)
					e1:SetType(EFFECT_TYPE_SINGLE)
					e1:SetCode(EFFECT_UPDATE_LEVEL)
					e1:SetProperty(EFFECT_FLAG_CANNOT_DISABLE)
					e1:SetValue(-1)
					e1:SetReset(RESET_EVENT+0x1fe0000)
					tc1:RegisterEffect(e1)
				end
				tc1=og:GetNext()
			end
			Duel.SpecialSummonComplete()
		end
	end
end
