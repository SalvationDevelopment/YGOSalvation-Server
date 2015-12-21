--Greydoll Slime
function c13790698.initial_effect(c)
	--spsummon
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_DESTROY+CATEGORY_SPECIAL_SUMMON)
	e1:SetType(EFFECT_TYPE_IGNITION)
	e1:SetRange(LOCATION_HAND+LOCATION_GRAVE)
	e1:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e1:SetCountLimit(1,13790698)
	e1:SetTarget(c13790698.ssptg)
	e1:SetOperation(c13790698.sspop)
	c:RegisterEffect(e1)
	local e2=Effect.CreateEffect(c)
	e2:SetCategory(CATEGORY_SPECIAL_SUMMON)
	e2:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_TRIGGER_O)
	e2:SetCode(EVENT_SPSUMMON_SUCCESS)
	e2:SetTarget(c13790698.sptg)
	e2:SetOperation(c13790698.spop)
	c:RegisterEffect(e2)
end
function c13790698.desfilter(c)
	return c:IsFaceup() and c:IsSetCard(0x1e71) and c:IsDestructable()
end
function c13790698.desfilter2(c,e)
	return c13790698.desfilter(c) and c:IsCanBeEffectTarget(e)
end
function c13790698.ssptg(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return chkc:IsOnField() and chkc:IsControler(tp) and c13790698.desfilter(chkc) end
	local ft=Duel.GetLocationCount(tp,LOCATION_MZONE)
	local ct=-ft+1
	if chk==0 then return ct<=2 and e:GetHandler():IsCanBeSpecialSummoned(e,0,tp,false,false)
		and Duel.IsExistingTarget(c13790698.desfilter,tp,LOCATION_ONFIELD,0,2,nil)
		and (ct<=0 or Duel.IsExistingTarget(c13790698.desfilter,tp,LOCATION_MZONE,0,ct,nil)) end
	local g=nil
	if ct>0 then
		local tg=Duel.GetMatchingGroup(c13790698.desfilter2,tp,LOCATION_ONFIELD,0,nil,e)
		Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_DESTROY)
		g=tg:FilterSelect(tp,Card.IsLocation,ct,ct,nil,LOCATION_MZONE)
		if ct<2 then
			tg:Sub(g)
			Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_DESTROY)
			local g2=tg:Select(tp,2-ct,2-ct,nil)
			g:Merge(g2)
		end
		Duel.SetTargetCard(g)
	else
		Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_DESTROY)
		g=Duel.SelectTarget(tp,c13790698.desfilter,tp,LOCATION_ONFIELD,0,2,2,nil)
	end
	Duel.SetOperationInfo(0,CATEGORY_DESTROY,g,2,0,0)
	Duel.SetOperationInfo(0,CATEGORY_SPECIAL_SUMMON,e:GetHandler(),1,0,0)
end
function c13790698.sspop(e,tp,eg,ep,ev,re,r,rp)
	local g=Duel.GetChainInfo(0,CHAININFO_TARGET_CARDS):Filter(Card.IsRelateToEffect,nil,e)
	if Duel.Destroy(g,REASON_EFFECT)~=0 then
		Duel.SpecialSummon(e:GetHandler(),0,tp,tp,false,false,POS_FACEUP)
	end
	e:GetHandler():RegisterFlagEffect(16404809,RESET_EVENT+0x1ec0000+RESET_PHASE+PHASE_END,0,1)
end

function c13790698.spfilter(c,e,tp)
	return c:IsSetCard(0x1e71) and c:IsCanBeSpecialSummoned(e,0,tp,false,false)
		and not c:IsHasEffect(EFFECT_NECRO_VALLEY)
end
function c13790698.sptg(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return e:GetHandler():GetFlagEffect(16404809)~=0 and 
	Duel.GetLocationCount(tp,LOCATION_MZONE)>0 and
	Duel.IsExistingMatchingCard(c13790698.spfilter,tp,LOCATION_GRAVE,0,1,nil,e,tp) end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_SPSUMMON)
	local g=Duel.SelectTarget(tp,c13790698.spfilter,tp,LOCATION_GRAVE,0,1,1,nil,e,tp)
	Duel.SetOperationInfo(0,CATEGORY_SPECIAL_SUMMON,nil,1,tp,LOCATION_GRAVE)
end
function c13790698.spop(e,tp,eg,ep,ev,re,r,rp)
	if Duel.GetLocationCount(tp,LOCATION_MZONE)<=0 then return end
	local tc=Duel.GetFirstTarget()
	if tc:IsRelateToEffect(e) and Duel.SpecialSummonStep(tc,0,tp,tp,false,false,POS_FACEUP_DEFENCE) then
		Duel.SpecialSummonComplete()
	end
end
