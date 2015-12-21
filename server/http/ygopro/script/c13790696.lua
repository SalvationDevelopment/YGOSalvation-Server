--Greydle Parasite
function c13790696.initial_effect(c)
	--activate
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_FREE_CHAIN)
	e1:SetTarget(c13790696.target1)
	e1:SetOperation(c13790696.operation)
	c:RegisterEffect(e1)
	--
	local e2=Effect.CreateEffect(c)
	e2:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_TRIGGER_O)
	e2:SetCode(EVENT_ATTACK_ANNOUNCE)
	e2:SetRange(LOCATION_SZONE)
	e2:SetCountLimit(1,13790696)
	e2:SetCondition(c13790696.condition)
	e2:SetTarget(c13790696.target2)
	e2:SetOperation(c13790696.operation)
	c:RegisterEffect(e2)
end
function c13790696.spfilter1(c,e,tp)
	return c:IsSetCard(0x1e71) and c:IsCanBeSpecialSummoned(e,0,tp,false,false)
end
function c13790696.filter(c,e,tp)
	return c:IsCanBeSpecialSummoned(e,0,tp,false,false,POS_FACEUP_DEFENCE,1-tp)
end
function c13790696.condition(e,tp,eg,ep,ev,re,r,rp)
	return (Duel.GetAttacker():IsControler(1-tp) and Duel.GetAttackTarget()==nil and Duel.GetFieldGroupCount(tp,LOCATION_MZONE,0)==0)
	or (Duel.GetAttacker():IsControler(tp) and Duel.GetAttacker():IsSetCard(0x1e71) and Duel.GetAttackTarget()==nil and 
	Duel.GetFieldGroupCount(tp,0,LOCATION_MZONE)==0 and Duel.IsExistingTarget(c13790696.filter,tp,0,LOCATION_GRAVE,1,nil,e,tp))
	and Duel.GetFlagEffect(tp,13790696)==0
end
function c13790696.target1(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return true end
	if not Duel.CheckEvent(EVENT_ATTACK_ANNOUNCE) or Duel.GetFlagEffect(tp,13790696)~=0 then return false end
	if Duel.CheckEvent(EVENT_ATTACK_ANNOUNCE) and 
	(Duel.GetAttacker():IsControler(1-tp) and Duel.GetAttackTarget()==nil and Duel.SelectYesNo(tp,aux.Stringid(13790696,0)) 
	and Duel.GetFieldGroupCount(tp,LOCATION_MZONE,0)==0 and Duel.IsExistingMatchingCard(c13790696.spfilter1,tp,LOCATION_DECK,0,1,nil,e,tp))
		then
		Duel.RegisterFlagEffect(tp,13790696,RESET_EVENT+0x1fe0000+RESET_PHASE+PHASE_END,0,1)
		e:SetLabel(1)
	elseif (Duel.GetAttacker():IsControler(tp) and Duel.GetAttacker():IsSetCard(0x1e71) and Duel.GetAttackTarget()==nil and Duel.SelectYesNo(tp,aux.Stringid(13790696,1))
	 and Duel.GetFieldGroupCount(tp,0,LOCATION_MZONE)==0 and Duel.IsExistingTarget(c13790696.filter,tp,0,LOCATION_GRAVE,1,nil,e,tp)) then
	 Duel.RegisterFlagEffect(tp,13790696,RESET_EVENT+0x1fe0000+RESET_PHASE+PHASE_END,0,1)
	 e:SetLabel(2) 
	 local g=Duel.SelectTarget(tp,c13790696.filter,tp,0,LOCATION_GRAVE,1,1,nil,e,tp)
	 else
	 e:SetLabel(0)
	 end
end
function c13790696.target2(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return (Duel.GetAttacker():IsControler(1-tp) and Duel.GetAttackTarget()==nil and 
	Duel.GetFieldGroupCount(tp,LOCATION_MZONE,0)==0 and Duel.IsExistingMatchingCard(c13790696.spfilter1,tp,LOCATION_DECK,0,1,nil,e,tp))
	or (Duel.GetAttacker():IsControler(tp) and Duel.GetAttacker():IsSetCard(0x1e71) and Duel.GetAttackTarget()==nil and 
	Duel.GetFieldGroupCount(tp,0,LOCATION_MZONE)==0 and Duel.IsExistingTarget(c13790696.filter,tp,0,LOCATION_GRAVE,1,nil,e,tp)) end
	if Duel.GetAttacker():IsControler(tp) then	 
	 e:SetLabel(2) 
	 local g=Duel.SelectTarget(tp,c13790696.filter,tp,0,LOCATION_GRAVE,1,1,nil,e,tp)
	 else 
	 e:SetLabel(1) 
	 end
end
function c13790696.operation(e,tp,eg,ep,ev,re,r,rp)
	if e:GetLabel()==0 or not e:GetHandler():IsRelateToEffect(e) then return end
	if Duel.GetAttacker():IsControler(1-tp) and Duel.GetFieldGroupCount(tp,LOCATION_MZONE,0)==0 then 
	local g=Duel.SelectMatchingCard(tp,c13790696.spfilter1,tp,LOCATION_DECK,0,1,1,nil,e,tp)
		if g:GetCount()>0 then
			Duel.SpecialSummon(g,0,tp,tp,false,false,POS_FACEUP_ATTACK)
		end
	end
	if Duel.GetAttacker():IsControler(tp) and Duel.GetAttacker():IsSetCard(0x1e71)
	and Duel.GetFieldGroupCount(tp,0,LOCATION_MZONE)==0 then 
	local tc=Duel.GetFirstTarget()
		if tc:IsRelateToEffect(e) then
			Duel.SpecialSummon(tc,0,tp,1-tp,false,false,POS_FACEUP)
		end
	end	
end
