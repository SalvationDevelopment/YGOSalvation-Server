--双龍降臨
function c80200069.initial_effect(c)
	--activate
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_SPECIAL_SUMMON)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_ATTACK_ANNOUNCE)
	e1:SetCost(c80200069.cost)
	e1:SetTarget(c80200069.target)
	e1:SetOperation(c80200069.operation)
	c:RegisterEffect(e1)
end
function c80200069.cost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return  Duel.GetFlagEffect(tp,80200069)==0 end	
	Duel.RegisterFlagEffect(tp,80200069,RESET_PHASE+PHASE_END,EFFECT_FLAG_OATH,1)
end
function c80200069.filter(c,e,tp)
	return c:IsType(TYPE_XYZ) and c:IsAttribute(ATTRIBUTE_LIGHT) and c:IsRace(RACE_DRAGON) and c:IsCanBeSpecialSummoned(e,0,tp,false,true)
end
function c80200069.target(e,tp,eg,ep,ev,re,r,rp,chk)
	local at=Duel.GetAttacker()
	if chk==0 then return at:IsControler(1-tp) and at:IsType(TYPE_XYZ) 
	and Duel.GetAttackTarget()==nil and Duel.IsExistingMatchingCard(c80200069.filter,tp,LOCATION_EXTRA,0,1,nil,e,tp) end
	Duel.SetOperationInfo(0,CATEGORY_SPECIAL_SUMMON,nil,1,tp,LOCATION_EXTRA)
end
function c80200069.operation(e,tp,eg,ep,ev,re,r,rp)
	if Duel.GetLocationCount(tp,LOCATION_MZONE)<1 then return end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_SPSUMMON)
	local g=Duel.SelectMatchingCard(tp,c80200069.filter,tp,LOCATION_EXTRA,0,1,1,nil,e,tp)
	local tc=g:GetFirst()
	if tc and Duel.SpecialSummon(tc,0,tp,tp,false,true,POS_FACEUP)>0 then
		local c=e:GetHandler()
		local a=Duel.GetAttacker()
		
		local e1=Effect.CreateEffect(c)
		e1:SetType(EFFECT_TYPE_SINGLE)
		e1:SetCode(EFFECT_DISABLE)
		e1:SetReset(RESET_EVENT+0x1fe0000)
		tc:RegisterEffect(e1,true)
		local e2=e1:Clone()
		e2:SetCode(EFFECT_DISABLE_EFFECT)
		tc:RegisterEffect(e2,true)
		local e3=Effect.CreateEffect(c)
		e3:SetType(EFFECT_TYPE_SINGLE)
		e3:SetCode(EFFECT_SET_ATTACK_FINAL)
		e3:SetValue(a:GetAttack())
		e3:SetReset(RESET_EVENT+0x1fe0000)
		tc:RegisterEffect(e3,true)
		
		if a:IsOnField() and a:IsFaceup() then
			Duel.CalculateDamage(a,tc)
		end
	end
end