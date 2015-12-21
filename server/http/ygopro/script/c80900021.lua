--ガガガ学園の緊急連絡網
function c80900001.initial_effect(c)
	--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_SPECIAL_SUMMON)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_FREE_CHAIN)
	e1:SetCondition(c80900001.condition)
	e1:SetCost(c80900001.cost)
	e1:SetTarget(c80900001.target)
	e1:SetOperation(c80900001.activate)
	c:RegisterEffect(e1)
	if not c80900001.global_check then
		c80900001.global_check=true
		local ge1=Effect.CreateEffect(c)
		ge1:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_CONTINUOUS)
		ge1:SetCode(EVENT_SPSUMMON_SUCCESS)
		ge1:SetOperation(c80900001.checkop)
		Duel.RegisterEffect(ge1,0)
	end
end
function c80900001.checkop(e,tp,eg,ep,ev,re,r,rp)
	local tc=eg:GetFirst()
	while tc do
		local sump=tc:GetSummonPlayer()
		if Duel.GetFlagEffect(sump,80900001)==0 and tc:GetSummonType()~=SUMMON_TYPE_XYZ then
			Duel.RegisterFlagEffect(sump,80900001,RESET_PHASE+PHASE_END,0,1)
		end
		tc=eg:GetNext()
	end
end
function c80900001.condition(e,tp,eg,ep,ev,re,r,rp)
	return Duel.GetFieldGroupCount(tp,0,LOCATION_MZONE)>0
		and Duel.GetFieldGroupCount(tp,LOCATION_MZONE,0)==0
end
function c80900001.cost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.GetFlagEffect(tp,80900001)==0 end
	Duel.RegisterFlagEffect(tp,80900001,RESET_PHASE+PHASE_END,EFFECT_FLAG_OATH,1)
end
function c80900001.spfilter(c,e,tp)
	return c:IsSetCard(0x54) and c:IsCanBeSpecialSummoned(e,0,tp,false,false)
end
function c80900001.target(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.GetLocationCount(tp,LOCATION_MZONE)>0
		and Duel.IsExistingMatchingCard(c80900001.spfilter,tp,LOCATION_DECK,0,1,nil,e,tp) end
	Duel.SetOperationInfo(0,CATEGORY_SPECIAL_SUMMON,nil,1,tp,LOCATION_DECK)
end
function c80900001.activate(e,tp,eg,ep,ev,re,r,rp)
	if Duel.GetLocationCount(tp,LOCATION_MZONE)<=0 then return end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_SPSUMMON)
	local g=Duel.SelectMatchingCard(tp,c80900001.spfilter,tp,LOCATION_DECK,0,1,1,nil,e,tp)
	if g:GetCount()>0 then
		Duel.SpecialSummon(g,0,tp,tp,false,false,POS_FACEUP)
	end
end