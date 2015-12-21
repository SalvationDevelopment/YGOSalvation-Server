--Ｈ·Ｃ アンブッシュ·ソルジャー
function c800000010.initial_effect(c)
	--special summon
	local e2=Effect.CreateEffect(c)
	e2:SetDescription(aux.Stringid(800000010,0))
	e2:SetCategory(CATEGORY_SPECIAL_SUMMON)
	e2:SetType(EFFECT_TYPE_TRIGGER_O+EFFECT_TYPE_FIELD)
	e2:SetRange(LOCATION_MZONE)
	e2:SetCode(EVENT_PHASE+PHASE_STANDBY)
	e2:SetCondition(c800000010.con)
	e2:SetCost(c800000010.spcost)
	e2:SetTarget(c800000010.sptg)
	e2:SetOperation(c800000010.spop)
	c:RegisterEffect(e2)
end
function c800000010.con(e,tp,eg,ep,ev,re,r,rp)
	return Duel.GetTurnPlayer()==tp
end
function c800000010.spcost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return e:GetHandler():IsReleasable() and Duel.GetFlagEffect(tp,800000010)==0 end
	Duel.Release(e:GetHandler(),REASON_COST)
	Duel.RegisterFlagEffect(tp,800000010,RESET_PHASE+PHASE_END,0,1)
end
function c800000010.filter(c,e,tp)
	return c:IsSetCard(0x6f) and c:IsType(TYPE_MONSTER) and not c:IsCode(800000010)
		and c:IsCanBeSpecialSummoned(e,0,tp,false,false)
end
function c800000010.sptg(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.GetLocationCount(tp,LOCATION_MZONE)>1
		and Duel.IsExistingMatchingCard(c800000010.filter,tp,LOCATION_HAND+LOCATION_GRAVE,0,2,nil,e,tp) end
	Duel.SetOperationInfo(0,CATEGORY_SPECIAL_SUMMON,nil,2,tp,LOCATION_HAND+LOCATION_GRAVE)

end
function c800000010.spop(e,tp,eg,ep,ev,re,r,rp)
    local c=e:GetHandler()
	if Duel.GetLocationCount(tp,LOCATION_MZONE)<2 then return end
	local g=Duel.GetMatchingGroup(c800000010.filter,tp,LOCATION_HAND+LOCATION_GRAVE,0,nil,e,tp)
	if g:GetCount()>=2 then
		Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_SPSUMMON)
		local sg=g:Select(tp,2,2,nil)
		Duel.SpecialSummon(sg,0,tp,tp,false,false,POS_FACEUP)
		if Duel.IsExistingMatchingCard(c800000010.lvfilter,tp,LOCATION_MZONE,0,1,nil) and c:IsAbleToRemoveAsCost()
		    and Duel.SelectYesNo(tp,aux.Stringid(800000010,1)) then 
			Duel.BreakEffect()
			Duel.Remove(e:GetHandler(),POS_FACEUP,REASON_EFFECT)
		    local g=Duel.GetMatchingGroup(c800000010.lvfilter,tp,LOCATION_MZONE,0,nil)
	        local tc=g:GetFirst()
	        while tc do
		        local e1=Effect.CreateEffect(c)
		        e1:SetType(EFFECT_TYPE_SINGLE)
		        e1:SetProperty(EFFECT_FLAG_CANNOT_DISABLE)
		        e1:SetCode(EFFECT_CHANGE_LEVEL)
		        e1:SetValue(1)
		        e1:SetReset(RESET_EVENT+0x1fe0000+RESET_PHASE+PHASE_END)
		        tc:RegisterEffect(e1)
		        tc=g:GetNext()
	        end
		end
	end
end
function c800000010.lvfilter(c)
	return c:IsSetCard(0x6f) and c:GetLevel()~=1 and c:GetLevel()>0 and c:IsFaceup()
end
