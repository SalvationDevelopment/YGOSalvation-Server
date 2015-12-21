--妖仙獣左鎌神柱
function c80100106.initial_effect(c)
	--pendulum summon
	aux.AddPendulumProcedure(c)
	--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_FREE_CHAIN)
	c:RegisterEffect(e1)
	--destroy replace
	local e2=Effect.CreateEffect(c)
	e3:SetDescription(aux.Stringid(80100106,0))
	e2:SetType(EFFECT_TYPE_CONTINUOUS+EFFECT_TYPE_FIELD)
	e2:SetCode(EFFECT_DESTROY_REPLACE)
	e2:SetRange(LOCATION_PZONE)
	e2:SetTarget(c80100106.destg)
	e2:SetValue(c80100106.repval)
	c:RegisterEffect(e2)	
	--to defence
	local e3=Effect.CreateEffect(c)
	e3:SetDescription(aux.Stringid(80100106,1))
	e3:SetCategory(CATEGORY_POSITION)
	e3:SetType(EFFECT_TYPE_TRIGGER_F+EFFECT_TYPE_SINGLE)
	e3:SetCode(EVENT_SUMMON_SUCCESS)
	e3:SetTarget(c80100106.potg)
	e3:SetOperation(c80100106.poop)
	c:RegisterEffect(e3)	
	--untargetable
	local e4=Effect.CreateEffect(c)
	e4:SetType(EFFECT_TYPE_FIELD)
	e4:SetCode(EFFECT_CANNOT_BE_EFFECT_TARGET)
	e4:SetRange(LOCATION_MZONE)
	e4:SetTargetRange(LOCATION_MZONE,0)
	e4:SetTarget(c80100106.target)
	e4:SetValue(c80100106.val)
	c:RegisterEffect(e4)
end
function c80100106.rfilter(c,tp)
	return c:IsFaceup() and c:IsLocation(LOCATION_MZONE) and c:IsSetCard(0xb3) and c:IsControler(tp)
end
function c80100106.destg(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return eg:IsExists(c80100106.rfilter,1,e:GetHandler(),tp) end
	if Duel.SelectYesNo(tp,aux.Stringid(80100106,0)) then
		Duel.Destroy(e:GetHandler(),REASON_EFFECT+REASON_REPLACE)
		return true
	else return false end
end
function c80100106.repval(e,c)
	return c:IsFaceup() and c:IsSetCard(0xb3) and c:IsControler(tp)
end
function c80100106.potg(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chk==0 then return e:GetHandler():IsAttackPos() end
	Duel.SetOperationInfo(0,CATEGORY_POSITION,e:GetHandler(),1,0,0)
end
function c80100106.poop(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	if c:IsFaceup() and c:IsAttackPos() and c:IsRelateToEffect(e) then
		Duel.ChangePosition(c,POS_FACEUP_DEFENCE)
	end
end
function c80100106.target(e,c)
	return c:IsSetCard(0xb3) and c~=e:GetHandler()
end
function c80100106.val(e,re,rp)
	return rp~=e:GetOwnerPlayer()
end