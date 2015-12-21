--Sacred Defence Barrier
function c12337.initial_effect(c)
	--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_FREE_CHAIN)
	c:RegisterEffect(e1)
	--remove
	local e2=Effect.CreateEffect(c)
	e2:SetCategory(CATEGORY_COUNTER)
	e2:SetDescription(aux.Stringid(12337,0))
	e2:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_TRIGGER_F)
	e2:SetRange(LOCATION_SZONE)
	e2:SetCode(EVENT_SUMMON_SUCCESS)
	e2:SetTarget(c12337.target)
	e2:SetOperation(c12337.activate)
	c:RegisterEffect(e2)
	local e3=Effect.CreateEffect(c)
	e3:SetCategory(CATEGORY_COUNTER)
	e3:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_TRIGGER_F)
	e3:SetRange(LOCATION_SZONE)
	e3:SetCode(EVENT_FLIP_SUMMON_SUCCESS)
	e3:SetTarget(c12337.target)
	e3:SetOperation(c12337.activate)
	c:RegisterEffect(e3)
	local e4=Effect.CreateEffect(c)
	e4:SetCategory(CATEGORY_COUNTER)
	e4:SetDescription(aux.Stringid(87902575,0))
	e4:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_TRIGGER_F)
	e4:SetRange(LOCATION_SZONE)
	e4:SetCondition(c12337.condition)
	e4:SetCode(EVENT_SPSUMMON_SUCCESS)
	e4:SetTarget(c12337.target)
	e4:SetOperation(c12337.activate)
	c:RegisterEffect(e4)

end

function c12337.condition(e,tp,eg,ep,ev,re,r,rp)
	local g=eg:Filter(c12337.filter,nil,tp)
	if g:GetCount()~=1 then return end
	local tc=g:GetFirst()
	e:SetLabelObject(tc)
	return tc:IsRace(RACE_ROCK) and Duel.IsExistingMatchingCard(Card.IsFaceup,tp,LOCATION_MZONE,LOCATION_MZONE,1,nil)
end


function c12337.filter(c,tp,ep)
	return c:IsFaceup() and c:IsRace(RACE_ROCK)
end
function c12337.target(e,tp,eg,ep,ev,re,r,rp,chk)
	local tc=eg:GetFirst()
	if chk==0 then return c12337.filter(tc,tp,ep) end
	Duel.SetTargetCard(eg)
	Duel.SetOperationInfo(0,CATEGORY_COUNTER,nil,1,0,0x21)
end
function c12337.activate(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	local tc=eg:GetFirst()
	if tc and tc:IsRelateToEffect(e) and tc:IsFaceup() and tc:IsRace(RACE_ROCK) then
		tc:AddCounter(0x21,1)
		local e1=Effect.CreateEffect(c)
		e1:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_CONTINUOUS)
		e1:SetCode(EFFECT_DESTROY_REPLACE)
		e1:SetTarget(c12337.reptg)
		e1:SetOperation(c12337.repop)
		e1:SetReset(RESET_EVENT+0x1fe0000)
		tc:RegisterEffect(e1)		
	end
end


function c12337.reptg(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return e:GetHandler():GetCounter(0x21)>0 end
	return true
end
function c12337.repop(e,tp,eg,ep,ev,re,r,rp,chk)
	e:GetHandler():RemoveCounter(tp,0x21,1,REASON_EFFECT)
end
