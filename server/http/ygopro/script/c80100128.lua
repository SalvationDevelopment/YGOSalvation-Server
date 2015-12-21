--Heroic Ritual Beast Tamer – Sephira Mupirika
--CHIBI FIX ARCHETYPE CRAP NYANYANYANYANYANYANYANYANYANYANYANYANYA
--CHIBI FIX ARCHETYPE CRAP NYANYANYANYANYANYANYANYANYANYANYANYANYA
function c80100128.initial_effect(c)
--pendulum summon
	aux.AddPendulumProcedure(c)
	--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_FREE_CHAIN)
	c:RegisterEffect(e1)
	--splimit
	local e2=Effect.CreateEffect(c)
	e2:SetType(EFFECT_TYPE_FIELD)
	e2:SetCode(EFFECT_CANNOT_SPECIAL_SUMMON)
	e2:SetProperty(EFFECT_FLAG_PLAYER_TARGET+EFFECT_FLAG_CANNOT_DISABLE)
	e2:SetRange(LOCATION_PZONE)
	e2:SetTargetRange(1,0)
	e2:SetTarget(c80100128.splimit)
	c:RegisterEffect(e2)
	--effect
	local e3=Effect.CreateEffect(c)
	e3:SetDescription(aux.Stringid(80100128,0))
	e3:SetCategory(CATEGORY_DESTROY)
	e3:SetType(EFFECT_TYPE_TRIGGER_O+EFFECT_TYPE_SINGLE)
	e3:SetCode(EVENT_SUMMON_SUCCESS)
	e3:SetCountLimit(1,80100128)
	e3:SetTarget(c80100128.tg)
	e3:SetOperation(c80100128.op)
	c:RegisterEffect(e3)
	local e4=Effect.CreateEffect(c)
	e4:SetDescription(aux.Stringid(80100128,0))
	e4:SetCategory(CATEGORY_DESTROY)
	e4:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_TRIGGER_O)
	e4:SetCode(EVENT_SPSUMMON_SUCCESS)
	e4:SetCountLimit(1,80100128)
	e4:SetCondition(c80100128.spcon)
	e4:SetTarget(c80100128.tg)
	e4:SetOperation(c80100128.op)
	c:RegisterEffect(e4)
	--spsummon limit
	local e5=Effect.CreateEffect(c)
	e5:SetType(EFFECT_TYPE_SINGLE)
	e5:SetCode(EFFECT_CANNOT_SPECIAL_SUMMON)
	e5:SetCondition(c80100128.limcon)
	c:RegisterEffect(e5)
	if not c80100128.global_check then
		c80100128.global_check=true
		local ge1=Effect.CreateEffect(c)
		ge1:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_CONTINUOUS)
		ge1:SetCode(EVENT_SPSUMMON_SUCCESS)
		ge1:SetOperation(c80100128.checkop)
		Duel.RegisterEffect(ge1,0)
	end
end
function c80100128.checkop(e,tp,eg,ep,ev,re,r,rp)
	local tc=eg:GetFirst()
	local p1=false
	local p2=false
	while tc do
		if tc:IsCode(80100128) then
			if tc:GetSummonPlayer()==0 then p1=true else p2=true end
		end
		tc=eg:GetNext()
	end
	if p1 then Duel.RegisterFlagEffect(0,80100128,RESET_PHASE+PHASE_END,0,1) end
	if p2 then Duel.RegisterFlagEffect(1,80100128,RESET_PHASE+PHASE_END,0,1) end
end
function c80100128.limcon(e)
	return Duel.GetFlagEffect(e:GetHandlerPlayer(),80100128)~=0
end
function c80100128.splimit(e,c,tp,sumtp,sumpos)
	return not c:IsSetCard(0xb5) and not c:IsSetCard(0xc3) and bit.band(sumtp,SUMMON_TYPE_PENDULUM)==SUMMON_TYPE_PENDULUM
end
function c80100128.spcon(e,tp,eg,ep,ev,re,r,rp)
	return  e:GetHandler():GetSummonType()==SUMMON_TYPE_PENDULUM
end
function c80100128.filter(c,e,tp)
	return (c:IsSetCard(0xb5) or c:IsSetCard(0xc3)) and c:IsCanBeSpecialSummoned(e,0,tp,false,false)
end
function c80100128.tg(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return chkc:IsLocation(LOCATION_GRAVE) and chkc:IsControler(tp) and c80100128.filter(chkc,e,tp) end
	if chk==0 then return Duel.GetLocationCount(tp,LOCATION_MZONE)>0
		and Duel.IsExistingTarget(c80100128.filter,tp,LOCATION_GRAVE,0,1,nil,e,tp) end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_SPSUMMON)
	local g=Duel.SelectTarget(tp,c80100128.filter,tp,LOCATION_GRAVE,0,1,1,nil,e,tp)
	Duel.SetOperationInfo(0,CATEGORY_SPECIAL_SUMMON,g,1,0,0)
end
function c80100128.op(e,tp,eg,ep,ev,re,r,rp)
	if Duel.GetLocationCount(tp,LOCATION_MZONE)<=0 then return end
	local tc=Duel.GetFirstTarget()
	if tc:IsRelateToEffect(e) and Duel.SpecialSummon(tc,0,tp,tp,false,false,POS_FACEUP)~=0 then
		local e1=Effect.CreateEffect(e:GetHandler())
		e1:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_CONTINUOUS)
		e1:SetRange(LOCATION_MZONE)
		e1:SetCode(EVENT_PHASE+PHASE_END)
		e1:SetOperation(c80100128.desop)
		e1:SetReset(RESET_EVENT+0x1fe0000+RESET_PHASE+PHASE_END)
		e1:SetCountLimit(1)
		tc:RegisterEffect(e1)
	end
end
function c80100128.desop(e,tp,eg,ep,ev,re,r,rp)
	Duel.Destroy(e:GetHandler(),REASON_EFFECT)
end
