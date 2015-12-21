--妖仙獣右鎌神柱
function c80100107.initial_effect(c)
	--pendulum summon
	aux.AddPendulumProcedure(c)
	--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_FREE_CHAIN)
	c:RegisterEffect(e1)
	--scale
	local e2=Effect.CreateEffect(c)
	e3:SetDescription(aux.Stringid(80100107,0))
	e2:SetType(EFFECT_TYPE_IGNITION)
	e2:SetRange(LOCATION_PZONE)
	e2:SetCondition(c80100107.sccon)
	e2:SetTarget(c80100107.sctg)
	e2:SetValue(c80100107.scop)
	c:RegisterEffect(e2)	
	--to defence
	local e3=Effect.CreateEffect(c)
	e3:SetDescription(aux.Stringid(80100107,1))
	e3:SetCategory(CATEGORY_POSITION)
	e3:SetType(EFFECT_TYPE_TRIGGER_F+EFFECT_TYPE_SINGLE)
	e3:SetCode(EVENT_SUMMON_SUCCESS)
	e3:SetTarget(c80100107.potg)
	e3:SetOperation(c80100107.poop)
	c:RegisterEffect(e3)	
	--untargetable
	local e4=Effect.CreateEffect(c)
	e4:SetType(EFFECT_TYPE_FIELD)
	e4:SetCode(EFFECT_CANNOT_BE_BATTLE_TARGET)
	e4:SetRange(LOCATION_MZONE)
	e4:SetTargetRange(LOCATION_MZONE,0)
	e4:SetTarget(c80100107.target)
	e4:SetValue(1)
	c:RegisterEffect(e4)
end
function c80100107.sccon(e)
	local seq=e:GetHandler():GetSequence()
	local tc=Duel.GetFieldCard(e:GetHandlerPlayer(),LOCATION_SZONE,13-seq)
	return tc and tc:IsSetCard(0xb3)
end
function c80100107.sctg(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return true end
end
function c80100107.scop(e,tp,eg,ep,ev,re,r,rp)
	--scale
	local e4=Effect.CreateEffect(c)
	e4:SetType(EFFECT_TYPE_SINGLE)
	e4:SetCode(EFFECT_CHANGE_LSCALE)
	e4:SetProperty(EFFECT_FLAG_SINGLE_RANGE)
	e4:SetRange(LOCATION_PZONE)
	e4:SetReset(RESET_EVENT+0x1fe0000+RESET_PHASE+PHASE_END)
	e4:SetValue(11)
	c:RegisterEffect(e4)
	local e5=e4:Clone()
	e5:SetCode(EFFECT_CHANGE_RSCALE)
	c:RegisterEffect(e5)
	
	local e1=Effect.CreateEffect(e:GetHandler())
	e1:SetType(EFFECT_TYPE_FIELD)
	e1:SetProperty(EFFECT_FLAG_PLAYER_TARGET)
	e1:SetCode(EFFECT_CANNOT_SPECIAL_SUMMON)
	e1:SetTargetRange(1,0)
	e1:SetTarget(c80100107.splimit)
	e1:SetReset(RESET_PHASE+PHASE_END)
	Duel.RegisterEffect(e1,tp)
end
function c80100107.splimit(e,c)
	return not c:IsSetCard(0xb3)
end
function c80100107.potg(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chk==0 then return e:GetHandler():IsAttackPos() end
	Duel.SetOperationInfo(0,CATEGORY_POSITION,e:GetHandler(),1,0,0)
end
function c80100107.poop(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	if c:IsFaceup() and c:IsAttackPos() and c:IsRelateToEffect(e) then
		Duel.ChangePosition(c,POS_FACEUP_DEFENCE)
	end
end
function c80100107.target(e,c)
	return c:IsSetCard(0xb3) and c~=e:GetHandler()
end
function c80100107.val(e,re,rp)
	return rp~=e:GetOwnerPlayer()
end